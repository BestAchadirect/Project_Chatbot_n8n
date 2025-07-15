import React from 'react';
import ReactMarkdown from 'react-markdown';

function ProductCard({ title, description, image, link }) {
  return (
    <div className="product-card border rounded-lg p-3 mb-3 bg-white shadow-md">
      <div className="font-bold text-lg mb-1">{title}</div>
      {image && (
        <img src={image} alt={title} className="my-2 max-w-full rounded-md" style={{ maxWidth: '180px', maxHeight: '120px' }} />
      )}
      {description && (
        <ReactMarkdown
          children={description}
          components={{
            img: ({ node, ...props }) => (
              <img {...props} style={{ maxWidth: '80%', borderRadius: '10px' }} />
            ),
            a: ({ node, ...props }) => (
              <a {...props} style={{ color: '#1e88e5' }} target="_blank" rel="noopener noreferrer" />
            ),
            h3: ({ node, ...props }) => (
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '1em' }} {...props} />
            ),
          }}
        />
      )}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-600 underline hover:text-blue-800 transition-colors">
          View Product
        </a>
      )}
    </div>
  );
}

export default function MessageBubble({ message, sender, text, timestamp }) {
  // Support both new and old props
  const response = (message && message.data && message.data.response) || message?.response || text || '';
  const discountTable = Array.isArray(message?.data)
    ? message.data.filter(
        (row) => row['Order Amount'] && row['Discount']
      )
    : null;
  const productList = Array.isArray(message?.data)
    ? message.data.filter((item) => item.type === 'product')
    : null;

  // Determine bubble style based on sender or message.type
  const isUser = sender === 'user' || (message && message.sender === 'user');
  const isBot = sender === 'bot' || (message && message.sender === 'bot') || (message && message.type === 'answer');
  const isSystem = sender === 'system' || (message && message.sender === 'system');

  let bubbleClass = 'chat-bubble message-bubble max-w-[80%] p-3 rounded-[18px] word-break break-words shadow-sm text-base leading-6 relative';
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

  return (
    <div className={`chat-message flex ${isUser ? 'justify-end' : isBot ? 'justify-start' : 'justify-center'} mb-2`}>
      <div className={bubbleClass}>
        <div className="message-content mb-1">
          {productList && productList.length > 0 ? (
            <div>
              {productList.map((product, idx) => (
                <ProductCard
                  key={idx}
                  title={product.title}
                  description={product.description}
                  image={product.image}
                  link={product.link}
                />
              ))}
            </div>
          ) : discountTable && discountTable.length > 0 ? (
            <table className="w-full text-left border-collapse my-2">
              <thead>
                <tr>
                  <th className="border-b p-2">Order Amount</th>
                  <th className="border-b p-2">Discount</th>
                </tr>
              </thead>
              <tbody>
                {discountTable.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border-b p-2">{row['Order Amount']}</td>
                    <td className="border-b p-2">{row['Discount']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ReactMarkdown
              children={response}
              components={{
                img: ({ node, ...props }) => (
                  <img {...props} style={{ maxWidth: '80%', borderRadius: '10px' }} />
                ),
                a: ({ node, ...props }) => (
                  <a {...props} style={{ color: '#1e88e5' }} target="_blank" rel="noopener noreferrer" />
                ),
                h3: ({ node, ...props }) => (
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '1em' }} {...props} />
                ),
              }}
            />
          )}
        </div>
        <div className="message-time text-xs opacity-60">{timeString}</div>
      </div>
    </div>
  );
}