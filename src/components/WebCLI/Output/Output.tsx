import { useListener, usePrevious } from "@canonical/react-components";
import Ansi from "ansi-to-react";
import fastDeepEqual from "fast-deep-equal/es6";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { processCommandOutput } from "../utils";

import { HELP_HEIGHT, CONSIDER_CLOSED, DEFAULT_HEIGHT } from "./consts";
import type { Props } from "./types";
import { TestId } from "./types";

const defaultProcessOutput = (_command: string, messages: string[]) => (
  <Ansi>{messages.map((message) => `\n${message}`).join("")}</Ansi>
);

const dragHandles = ["webcli__output-dragarea", "webcli__output-handle"];

const WebCLIOutput = ({
  content,
  command,
  helpMessage,
  loading,
  processOutput,
  showHelp,
  setShouldShowHelp,
}: Props) => {
  const resizeDeltaY = useRef(0);
  const dragNode = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(1);
  const [dragHeight, setDragHeight] = useState(0);
  const showHelpPrevious = usePrevious(showHelp, false);
  const contentPrevious = usePrevious(content, false);

  const onResize = useCallback(() => {
    if (dragNode.current) {
      setDragHeight(dragNode.current.clientHeight);
    }
  }, []);

  useListener(window, onResize, "resize", true, true);

  useEffect(() => {
    // Set the drag height on first render.
    onResize();
  }, [onResize]);

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
      if (typeof e.targetTouches?.[0]?.pageY === "number") {
        resizeDeltaY.current = e.targetTouches[0].pageY;
      } else if (typeof rect?.top === "number") {
        resizeDeltaY.current = 0 - rect.top;
      } else {
        resizeDeltaY.current = 0;
      }
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
    window.addEventListener("touchend", removeListener, { passive: false });
    return () => {
      window.removeEventListener("mousedown", addMouseResizeListener);
      window.removeEventListener("mouseup", removeListener);
      window.removeEventListener("touchstart", addTouchResizeListener);
      window.removeEventListener("touchend", removeListener);
    };
  }, []);

  useEffect(() => {
    if (showHelp) {
      setHeight(HELP_HEIGHT + dragHeight);
    } else if (!showHelp && showHelpPrevious) {
      // The help got closed so also close the panel.
      setHeight(0);
    }
  }, [showHelp, dragHeight, showHelpPrevious]);

  useEffect(() => {
    if (height < CONSIDER_CLOSED) {
      setShouldShowHelp(false);
    }
  }, [height, setShouldShowHelp]);

  useEffect(() => {
    // New content is coming in, so check if we're collapsed and if we
    // are then open it back up.
    if (
      // Only trigger this condition if the content changes.
      !fastDeepEqual(content, contentPrevious) &&
      content.length &&
      height <= HELP_HEIGHT &&
      height !== DEFAULT_HEIGHT
    ) {
      setHeight(DEFAULT_HEIGHT);
    }
  }, [content, contentPrevious, height]);

  let output: ReactNode = null;
  if (command) {
    // Handle custom renders. If a renderer doesn't return anything then it
    // falls through to the next handler.
    try {
      if (!output && processOutput) {
        output = processCommandOutput(command, content, processOutput);
      }
      if (!output) {
        output = defaultProcessOutput(command, content);
      }
    } catch (err) {
      // If the provided processor fails (e.g. if the data isn't what was expected) then fall back to the default.
      output = defaultProcessOutput(command, content);
    }
  }

  return (
    <div className="webcli__output" style={{ height: `${height}px` }}>
      <div
        className="webcli__output-dragarea"
        aria-hidden={true}
        ref={dragNode}
      >
        <div className="webcli__output-handle"></div>
      </div>
      <pre
        className="webcli__output-content"
        style={{ height: `${height}px` }}
        data-testid={TestId.CONTENT}
      >
        {showHelp || (!loading && !content?.length) ? (
          <code data-testid={TestId.HELP}>{helpMessage}</code>
        ) : (
          <code data-testid={TestId.CODE}>{output}</code>
        )}
      </pre>
    </div>
  );
};

export default WebCLIOutput;
