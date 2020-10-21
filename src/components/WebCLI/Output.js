import React, { useMemo } from "react";

// Colors taken from the VSCode section of
// https://en.wikipedia.org/wiki/ANSI_escape_code#3/4_bit
const ansiColors = {
  0: null, // reset
  30: "0,0,0", // Black
  31: "205,49,49", // Red
  32: "13,188,121", // Green
  33: "229,229,16", // Yellow
  34: "26,114,200", //  Blue
  35: "188,63,188", // Magenta
  36: "17,168,205", // Cyan
  37: "229,229,229", // White
  90: "102,102,102", // Bright Black (Gray)
  91: "241,76,76", // Bright Red
  92: "35,209,139", // Bright Green
  93: "245,245,67", // Bright Yellow
  94: "59,142,234", // Bright Blue
  95: "214,112,214", // Bright Magenta
  96: "41,184,219", // Bright Cyan
  97: "229,229,229", // Bright White
};

const findANSICode = /\[\d{1,3}m/g;

const getStyle = (ansiCode) => {
  const fgColor = ansiColors[ansiCode];
  if (fgColor) {
    return `color: rgb(${fgColor})`;
  }
  // We may have been provided a background color.
  const bgColor = ansiColors[ansiCode - 10];
  if (bgColor) {
    return `color: rgb(${bgColor})`;
  }
};

const colorize = (content) => {
  const colors = Array.from(content.matchAll(findANSICode));
  console.log(colors);
  if (colors.length === 0) {
    return content;
  }

  let colorizedContent = "";
  let previousIndex = 0;
  colors.forEach((color, index) => {
    const ansiCode = color[0];
    const ansiCodeNumber = ansiCode.replace("[", "").replace("m", "");

    if (color.index !== 0 && previousIndex === 0) {
      // Add the content up until the first colour without wrapping it.
      colorizedContent =
        colorizedContent + content.substring(previousIndex, color.index);
      previousIndex = color.index;
    }
    console.log(colorizedContent);
    const endIndex = colors[index + 1]?.index || content.length;
    let part = content.substring(previousIndex, endIndex).replace(ansiCode, "");
    const style = getStyle(ansiCodeNumber);
    if (style) {
      part = `<span style="${style}">${part}</span>`;
    }
    colorizedContent = colorizedContent + part;
    previousIndex = color.index;
    console.log(colorizedContent);
    console.log("---");
  });
  return colorizedContent;
};

const WebCLIOutput = ({ content }) => {
  const colorizedContent = useMemo(() => colorize(content), [content]);

  return (
    <div className="webcli__output">
      <pre>
        <code>{colorizedContent}</code>
      </pre>
    </div>
  );
};

export default WebCLIOutput;
