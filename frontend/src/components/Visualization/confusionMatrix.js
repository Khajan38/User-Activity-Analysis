import Plot from 'react-plotly.js';
import {Card} from './../visualization_cards'

export default function ConfusionMatrix({ matrix, labels, accuracy }) {
  return(
  <Card title={`Confusion Matrix ( Accuracy: ${(accuracy * 100).toFixed(2)}%)`}>
    <Plot data={[{z: matrix, x: labels, y: labels, type: 'heatmap', 
      colorscale: [
        [0, "rgba(179, 229, 252, 0.7)"], // Light blue
        [0.5, "rgba(33, 150, 243, 0.7)"],  // Medium blue
        [0.7, "rgba(0, 121, 191, 0.7)"],   // Dark blue
        [1, "rgba(0, 72, 128, 0.7)"],  //  dark blue (high value of color )
      ],
      text: matrix.map(row => row.map(value => value.toString())),
      texttemplate: "%{text}",
      textfont: {color: "black", size: 14},
      showscale: true
    }]}
      layout={{
        width: 800, height: 400, 
        xaxis: {title: { text: 'Predicted', font: { size: 16 }, standoff: 10 }, tickvals: labels, ticktext: labels},
        yaxis: {title: { text: 'Actual', font: { size: 16 }, standoff: 10 }, tickvals: labels,ticktext: labels},
        margin: { t: 20, l: 100, r: 5, b: 50 },
      }}
      config={{ responsive: true }}/></Card>
  )
}