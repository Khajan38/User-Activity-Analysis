import Plot from 'react-plotly.js';

export default function MeetingScorePlot({ scores, threshold }) {
  const x = Object.keys(scores);
  const y = Object.values(scores);

  return (
    <div className="p-4">
      <h2>"Meeting" Class Probability Scores</h2>
      <Plot
        data={[{
          x: x.map((_, i) => i),
          y: y,
          mode: 'markers',
          type: 'scatter',
          marker: { color: 'blue', opacity: 0.6 },
        }]}
        layout={{
          shapes: [{
            type: 'line',
            x0: 0,
            x1: x.length,
            y0: threshold,
            y1: threshold,
            line: { color: 'red', dash: 'dash' },
          }],
          xaxis: { title: 'Email Index' },
          yaxis: { title: 'Probability of Being a Meeting' },
        }}
      />
    </div>
  );
}