import type { RetrievedChunk } from './api';

export function ChunkList({ chunks, usedSymbols }: { chunks: RetrievedChunk[]; usedSymbols: string[] }) {
  return (
    <table className="chunks">
      <thead>
        <tr>
          <th>#</th>
          <th>Score</th>
          <th>Symbol</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>
        {chunks.map((chunk) => (
          <tr key={chunk.rank}>
            <td>{chunk.rank}</td>
            <td className="score">{chunk.score.toFixed(2)}</td>
            <td>
              <details>
                <summary>
                  <code>{chunk.apiPath ?? chunk.symbol}</code>
                  <span className="kind">{chunk.kind}</span>
                  {usedSymbols.includes(chunk.symbol) && <span className="used">used</span>}
                </summary>
                <pre>{chunk.text}</pre>
              </details>
            </td>
            <td>
              <a href={chunk.url} target="_blank" rel="noreferrer">
                {chunk.file.replace('packages/sdk/src/', '')}:{chunk.lines[0]}-{chunk.lines[1]}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
