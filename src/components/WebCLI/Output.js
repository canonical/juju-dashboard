import React, { useEffect, useMemo, useRef, useState } from "react";

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
    const endIndex = colors[index + 1]?.index || content.length;
    let part = content.substring(color.index, endIndex).replace(ansiCode, "");
    const style = getStyle(ansiCodeNumber);
    if (style) {
      part = `<span style="${style}">${part}</span>`;
    }
    colorizedContent = colorizedContent + part;
    previousIndex = color.index;
  });
  return colorizedContent;
};

const DEFAULT_HEIGHT = 300;

const WebCLIOutput = ({ content, helpMessage, showHelp }) => {
  const resizeDeltaY = useRef(0);
  const [height, setHeight] = useState(1);

  useEffect(() => {
    const resize = (e) => {
      const viewPortHeight = window.innerHeight;
      const mousePosition = e.clientY + 40; // magic number
      const newHeight = viewPortHeight - mousePosition + resizeDeltaY.current;

      const maximumOutputHeight = viewPortHeight - 100; // magic number.
      if (newHeight < maximumOutputHeight && newHeight >= 0) {
        setHeight(newHeight);
      }
    };

    const addResizeListener = (e) => {
      if (e.target.classList.value !== "webcli__output-dragarea") {
        return;
      }
      resizeDeltaY.current = e.layerY;
      document.addEventListener("mousemove", resize);
    };

    const removeResizeListener = () => {
      document.removeEventListener("mousemove", resize);
    };

    window.addEventListener("mousedown", addResizeListener);
    window.addEventListener("mouseup", removeResizeListener);
    return () => {
      window.removeEventListener("mousedown", addResizeListener);
      window.removeEventListener("mouseup", removeResizeListener);
    };
  }, []);

  useEffect(() => {
    if (showHelp) {
      setHeight(50);
    }
  }, [showHelp]);

  useEffect(() => {
    // New content is coming in, so check if we're collapsed and if we
    // are then open it back up.
    // 20 is a magic number, sometimes the browser stops firing the drag at
    // an inoportune time and the element isn't left completely closed.
    if (content.length > 1 && height < 20 && height !== DEFAULT_HEIGHT) {
      setHeight(DEFAULT_HEIGHT);
    }
    // We can't have height as a dependency because we don't want this to run
    // when the height changes, only when the content comes in.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [content]);

  // Strip any color escape codes from the content.
  content = content.replaceAll("\u001b", "");
  const colorizedContent = useMemo(() => {
    if (showHelp) {
      return helpMessage;
    }
    return colorize(content);
  }, [content, showHelp, helpMessage]);

  return (
    <div className="webcli__output" style={{ height: `${height}px` }}>
      <div className="webcli__output-dragarea" aria-hidden={true}>
        <div className="webcli__output-handle"></div>
      </div>
      <pre className="webcli__output-content" style={{ height: `${height}px` }}>
        <code dangerouslySetInnerHTML={{ __html: colorizedContent }}></code>
      </pre>
    </div>
  );
};

export default WebCLIOutput;
