import React from "react";
import chroma from "chroma-js";

// Same color scale as the map
const scale = chroma.scale(["#f0f4ff", "#1E4DB7"]).domain([0, 1]);

const Legend = () => {
  const grades = [0, 0.25, 0.5, 0.75, 1]; // from low to high priority

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        fontSize: "14px",
        lineHeight: "18px",
      }}
    >
      <strong>Priority Score</strong>
      <div style={{ marginTop: "5px" }}>
        {grades.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                width: "20px",
                height: "12px",
                background: scale(g).hex(),
                marginRight: "6px",
                border: "1px solid #ccc",
              }}
            ></span>
            {g * 100}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
