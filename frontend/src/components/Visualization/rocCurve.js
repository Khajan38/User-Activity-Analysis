import Plot from 'react-plotly.js';
import {Card} from './../visualization_cards'

export default function ROCCurve({ rocData, best_thresholds }) {
  const colorPalette = [
    "rgba(33, 150, 243, 0.7)",  // Light Blue
    "rgba(0, 72, 128, 0.7)",  // Very dark blue (high value)
    "rgba(179, 229, 252, 0.7)", // Light blue
    "rgba(33, 150, 243, 0.7)",  // Medium blue
    "rgba(0, 121, 191, 0.7)",   // Dark blue
    "rgba(224, 242, 255, 0.7)" // Very light blue
  ];
  const classLabels = Object.keys(rocData);
  const traces = classLabels.flatMap((label, index) => {
    const item = rocData[label];
    const color = colorPalette[index % colorPalette.length];
    const auc = item.auc.toFixed(2);
    const bestThreshold = best_thresholds[label];
    const bestIndex = item.fpr.findIndex((fpr, i) => item.tpr[i] >= bestThreshold);
    const unifiedLabel = `${label} (AUC = ${auc}, Threshold = ${bestThreshold})`;
    const rocTrace = { x: item.fpr, y: item.tpr, type: 'scatter', mode: 'lines+markers', name: unifiedLabel, line: { color }};
    const thresholdTrace = {x: [item.fpr[bestIndex]], y: [item.tpr[bestIndex]], mode: 'markers', name: null,  showlegend: false, marker: { color: 'red', size: 10, symbol: 'star' }};
  return [rocTrace, thresholdTrace];
  });

  return (
    <Card title={"R O C  -  Curve By Categories"}>
      <Plot
        data={traces}
        layout={{
          width: 800, height: 400, 
          xaxis: {title: { text: 'False Positive Rate', font: { size: 16 }, standoff: 10 }, range: [0, 1]},
          yaxis: {title: { text: 'True Positive Rate', font: { size: 16 }, standoff: 10 }, range: [0, 1]},
          shapes: [{
            type: 'line',
            x0: 0, x1: 1, y0: 0, y1: 1,
            line: { dash: 'dot', color: 'grey' }
          }],
          margin: { t: 50, l: 60, r: 30, b: 0 },
          legend: {
            orientation: "h",
            x: 0.5,
            y: -0.2,
            xanchor: "center"
          }
        }}
        config={{ responsive: true }}
      />
    </Card>
  );
}