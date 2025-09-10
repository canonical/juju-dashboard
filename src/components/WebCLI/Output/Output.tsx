import { useListener, usePrevious } from "@canonical/react-components";
import fastDeepEqual from "fast-deep-equal/es6";
import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import OutputCommand from "./OutputCommand";
import {
  HELP_HEIGHT,
  CONSIDER_CLOSED,
  DEFAULT_HEIGHT,
  AUTO_SCROLL_DISTANCE,
} from "./consts";
import type { Props } from "./types";
import { TestId } from "./types";

const dragHandles = ["webcli__output-dragarea", "webcli__output-handle"];

const WebCLIOutput: FC<Props> = ({
  content,
  helpMessage,
  loading = false,
  processOutput,
  showHelp,
  setShouldShowHelp,
  tableLinks,
}: Props) => {
  const resizeDeltaY = useRef(0);
  const dragNode = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const [height, setHeight] = useState(1);
  const [dragHeight, setDragHeight] = useState(0);
  const showHelpPrevious = usePrevious(showHelp, false);
  const contentPrevious = usePrevious(content, false);
  const contentChanged = !fastDeepEqual(content, contentPrevious);

  const onResize = useCallback(() => {
    if (dragNode.current) {
      setDragHeight(dragNode.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (contentChanged && outputRef.current) {
      const newResponseHeight =
        document.querySelector(".webcli__output-content-response:last-child")
          ?.clientHeight ?? 0;
      const { scrollHeight } = outputRef.current;
      // Get the distance the scroll area is from the bottom.
      const distance =
        scrollHeight -
        (outputRef.current.clientHeight +
          outputRef.current.scrollTop +
          // Need to get the position from the bottom before the new content in.
          newResponseHeight);
      if (distance <= AUTO_SCROLL_DISTANCE) {
        outputRef.current.scrollTo({ top: scrollHeight });
      }
    }
  }, [contentChanged]);

  useListener(window, onResize, "resize", true, true);

  useEffect(() => {
    // Set the drag height on first render.
    onResize();
  }, [onResize]);

  useEffect(() => {
    const resize = (clientY: number): void => {
      const viewPortHeight = window.innerHeight;
      const mousePosition = clientY + 40; // magic number
      const newHeight = viewPortHeight - mousePosition + resizeDeltaY.current;
      const maximumOutputHeight = viewPortHeight - 100; // magic number.
      if (newHeight < maximumOutputHeight && newHeight >= 10) {
        setHeight(newHeight);
      }
    };

    const resizeMouse = (ev: MouseEvent): void => {
      ev.preventDefault();
      resize(ev.clientY);
    };

    const resizeTouch = (ev: TouchEvent): void => {
      ev.preventDefault();
      resize(ev.touches[0].clientY);
    };

    const addMouseResizeListener = (ev: MouseEvent): void => {
      const target = ev.target as HTMLElement;
      if (!dragHandles.includes(target?.classList.value)) {
        return;
      }
      resizeDeltaY.current = ev.offsetY ?? 0;
      document.addEventListener("mousemove", resizeMouse);
    };

    const addTouchResizeListener = (ev: TouchEvent): void => {
      const target = ev.target as HTMLElement;
      if (!dragHandles.includes(target?.classList.value)) {
        return;
      }
      const rect = target.getBoundingClientRect();
      if (typeof ev.targetTouches?.[0]?.pageY === "number") {
        resizeDeltaY.current = ev.targetTouches[0].pageY;
      } else if (typeof rect?.top === "number") {
        resizeDeltaY.current = 0 - rect.top;
      } else {
        resizeDeltaY.current = 0;
      }
      document.addEventListener("touchmove", resizeTouch, { passive: false });
    };

    const removeListener = (): void => {
      document.removeEventListener("mousemove", resizeMouse);
      document.removeEventListener("touchmove", resizeTouch);
    };

    window.addEventListener("mousedown", addMouseResizeListener);
    window.addEventListener("mouseup", removeListener);
    window.addEventListener("touchstart", addTouchResizeListener, {
      passive: false,
    });
    window.addEventListener("touchend", removeListener, { passive: false });
    return (): void => {
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
      contentChanged &&
      content.length &&
      height <= HELP_HEIGHT &&
      height !== DEFAULT_HEIGHT
    ) {
      setHeight(DEFAULT_HEIGHT);
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }
  }, [content, contentChanged, height]);

  const output = content.map((historyItem, i) => (
    <OutputCommand
      {...historyItem}
      key={`message-${i}`}
      tableLinks={tableLinks}
      processOutput={processOutput}
    />
  ));

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
        ref={outputRef}
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
