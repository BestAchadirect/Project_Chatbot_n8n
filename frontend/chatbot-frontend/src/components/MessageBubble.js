import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ sender, text, timestamp }) {
  // Determine bubble style based on sender
  const isUser = sender === 'user';
  const isBot = sender === 'bot';
  const isSystem = sender === 'system';

  let bubbleClass =
    'message-bubble max-w-[80%] p-3 rounded-[18px] word-break break-words shadow-sm text-base leading-6 relative';
  if (isUser) {
    bubbleClass += ' bg-[#214166] text-white rounded-br-[4px] ml-auto';
  } else if (isBot) {
    bubbleClass += ' bg-[#96D0E6] text-[#0C2038] rounded-bl-[4px] mr-auto';
  } else if (isSystem) {
    bubbleClass += ' bg-gray-100 text-gray-500 rounded-[12px] text-sm mx-auto';
  }

  // Format timestamp as HH:mm:ss
  let timeString = '';
  if (timestamp) {
    const date = new Date(timestamp);
    timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } else {
    timeString = new Date().toLocaleTimeString();
  }

  // Custom renderers for links and images
  const markdownComponents = {
    a: ({node, ...props}) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800 transition-colors"
      />
    ),
    img: ({node, ...props}) => (
      <img
        {...props}
        className="inline-block max-w-[180px] max-h-[120px] rounded shadow-md border border-gray-200 my-2 align-middle"
        alt={props.alt || ''}
      />
    )
  };

  return (
    <div className={`chat-message flex ${isUser ? 'justify-end' : isBot ? 'justify-start' : 'justify-center'} mb-2`}>
      <div className={bubbleClass}>
        <div className="message-content mb-1">
          <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
        </div>
        <div className="message-time text-xs opacity-60">{timeString}</div>
      </div>
    </div>
  );
}