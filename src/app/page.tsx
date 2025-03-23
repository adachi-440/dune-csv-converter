'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [queryId, setQueryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!queryId.trim()) {
      setError('Please enter a query ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCsvUrl(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_DUNE_API_KEY;

      if (!apiKey) {
        throw new Error('API key is not configured');
      }

      // Fetch CSV data from Dune API
      const response = await fetch(
        `https://api.dune.com/api/v1/query/${queryId}/results/csv`,
        {
          headers: {
            'x-dune-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || `An error occurred (${response.status})`
        );
      }

      // Get CSV data
      const csvData = await response.text();

      // Create Blob and generate URL for download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      setCsvUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Dune CSV Downloader</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a Dune Analytics query ID to download the results as a CSV file.
        </p>
      </header>

      <main className="flex flex-col gap-6 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="query-id" className="font-medium">
              Dune Query ID
            </label>
            <input
              id="query-id"
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Example: 1234567"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Download CSV'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {csvUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400 mb-2">
              CSV file is ready!
            </p>
            <a
              href={csvUrl}
              download={`dune-query-${queryId}.csv`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Image
                src="/file.svg"
                alt="Download icon"
                width={16}
                height={16}
                className="mr-2 dark:invert"
              />
              Download
            </a>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-medium mb-2">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Find the desired query in Dune Analytics</li>
            <li>
              Check the query ID from the URL (e.g.,
              https://dune.com/queries/1234567)
            </li>
            <li>Enter the query ID in the form above</li>
            <li>Click the &quot;Download CSV&quot; button</li>
            <li>Download the CSV file</li>
          </ol>
        </div>
      </main>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://docs.dune.com/api-reference/executions/endpoint/get-query-result-csv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            className="dark:invert"
          />
          Dune API Documentation
        </a>
      </footer>
    </div>
  );
}
