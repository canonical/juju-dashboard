import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export enum TestId {
  CODE = "output-code",
  CONTENT = "output-content",
  HELP = "output-help",
}

type Props = {
  content: string;
  helpMessage: ReactNode;
  showHelp: boolean;
  setShouldShowHelp: (showHelp: boolean) => void;
};

// Colors taken from the VSCode section of
// https://en.wikipedia.org/wiki/ANSI_escape_code#3/4_bit
export const ansiColors = {
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

const getStyle = (ansiCode: number) => {
  const fgColor = ansiColors[ansiCode as keyof typeof ansiColors];
  if (fgColor) {
    return `color: rgb(${fgColor})`;
  }
  // We may have been provided a background color.
  const bgColor = ansiColors[(ansiCode - 10) as keyof typeof ansiColors];
  if (bgColor) {
    return `color: rgb(${bgColor})`;
  }
};

const colorize = (content: string) => {
  const colors = Array.from(content.matchAll(findANSICode));
  if (colors.length === 0) {
    return content;
  }

  let colorizedContent = "";
  colors.forEach((color, index) => {
    const ansiCode = color[0];
    const ansiCodeNumber = ansiCode.replace("[", "").replace("m", "");

    if (color.index !== 0 && index === 0) {
      // Add the content up until the first colour without wrapping it.
      colorizedContent += content.substring(0, color.index);
    }
    const endIndex = colors[index + 1]?.index || content.length;
    let part = content
      .substring(color.index ?? 0, endIndex)
      .replace(ansiCode, "");
    const style = getStyle(Number(ansiCodeNumber));
    if (style) {
      part = `<span style="${style}">${part}</span>`;
    }
    colorizedContent = colorizedContent + part;
  });
  return colorizedContent;
};

const DEFAULT_HEIGHT = 300;
// 20 is a magic number, sometimes the browser stops firing the drag at
// an inopportune time and the element isn't left completely closed.
const CONSIDER_CLOSED = 20;
const HELP_HEIGHT = 50;
const dragHandles = ["webcli__output-dragarea", "webcli__output-handle"];

const WebCLIOutput = ({
  content,
  helpMessage,
  showHelp,
  setShouldShowHelp,
}: Props) => {
  const resizeDeltaY = useRef(0);
  const [height, setHeight] = useState(1);

  useEffect(() => {
    const resize = (clientY: number) => {
      const viewPortHeight = window.innerHeight;
      const mousePosition = clientY + 40; // magic number
      const newHeight = viewPortHeight - mousePosition + resizeDeltaY.current;
      const maximumOutputHeight = viewPortHeight - 100; // magic number.
      if (newHeight < maximumOutputHeight && newHeight >= 10) {
        setHeight(newHeight);
      }
    };

    const resizeMouse = (e: MouseEvent) => {
      e.preventDefault();
      resize(e.clientY);
    };

    const resizeTouch = (e: TouchEvent) => {
      e.preventDefault();
      resize(e.touches[0].clientY);
    };

    const addMouseResizeListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!dragHandles.includes(target?.classList.value)) {
        return;
      }
      resizeDeltaY.current = e.offsetY ?? 0;
      document.addEventListener("mousemove", resizeMouse);
    };

    const addTouchResizeListener = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!dragHandles.includes(target?.classList.value)) {
        return;
      }
      const rect = target.getBoundingClientRect();
      resizeDeltaY.current = e.targetTouches?.[0]?.pageY ?? 0 - rect?.top ?? 0;
      document.addEventListener("touchmove", resizeTouch, { passive: false });
    };

    const removeListener = () => {
      document.removeEventListener("mousemove", resizeMouse);
      document.removeEventListener("touchmove", resizeTouch);
    };

    window.addEventListener("mousedown", addMouseResizeListener);
    window.addEventListener("mouseup", removeListener);
    window.addEventListener("touchstart", addTouchResizeListener, {
      passive: false,
    });
    window.addEventListener("touchend", removeListener, {
      passive: false,
    });
    return () => {
      window.removeEventListener("mousedown", addMouseResizeListener);
      window.removeEventListener("mouseup", removeListener);
      window.removeEventListener("touchstart", addTouchResizeListener);
      window.removeEventListener("touchend", removeListener);
    };
  }, []);

  useEffect(() => {
    if (showHelp) {
      setHeight(HELP_HEIGHT);
    }
  }, [showHelp]);

  useEffect(() => {
    if (height < CONSIDER_CLOSED) {
      setShouldShowHelp(false);
    }
  }, [height, setShouldShowHelp]);

  useEffect(() => {
    // New content is coming in, so check if we're collapsed and if we
    // are then open it back up.
    if (
      content.length > 1 &&
      height <= HELP_HEIGHT &&
      height !== DEFAULT_HEIGHT
    ) {
      setHeight(DEFAULT_HEIGHT);
    }
    // We can't have height as a dependency because we don't want this to run
    // when the height changes, only when the content comes in.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [content]);

  // Strip any color escape codes from the content.
  content = content.replace(/\\u001b/gi, "");
  const colorizedContent = useMemo(() => colorize(content), [content]);

  return (
    <div className="webcli__output" style={{ height: `${height}px` }}>
      <div className="webcli__output-dragarea" aria-hidden={true}>
        <div className="webcli__output-handle"></div>
      </div>
      <pre
        className="webcli__output-content"
        style={{ height: `${height}px` }}
        data-testid={TestId.CONTENT}
      >
        {showHelp || !content ? (
          <code data-testid={TestId.HELP}>{helpMessage}</code>
        ) : (
          <code
            data-testid={TestId.CODE}
            dangerouslySetInnerHTML={{ __html: colorizedContent }}
          ></code>
        )}
      </pre>
    </div>
  );
};

export default WebCLIOutput;
