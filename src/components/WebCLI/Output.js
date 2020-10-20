import React from "react";

const WebCLIOutput = ({ content }) => {
  return (
    <div className="webcli__output">
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default WebCLIOutput;
