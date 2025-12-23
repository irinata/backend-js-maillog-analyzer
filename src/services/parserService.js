import debugLib from 'debug';

const debug = debugLib('app:parser');

const idRe = /id=([^\s]+)/;
const flagRe = /^(?:=>|->|\*\*|==)$/;
const emailRe = /^([\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}):?\s+/;

const flagHandlers = {
  // special handlers
  '<=': (header) => {
    const [_, id] = header.rest.match(idRe) || [];
    return id ? { id } : null;
  },
};

function handleCommonFlags(header) {
  const [_, email] = header.rest.match(emailRe) || [];
  return email ? { address: email } : null;
}

function getHeader(line) {
  if (!line) return;
  const [date, time, intId, flag, ...rest] = line.split(' ');

  return {
    intId,
    flag,
    timestamp: `${date} ${time}`,
    rest: rest.join(' '),
  };
}

function parseLine(line) {
  const header = getHeader(line);
  let result = null;

  if (flagHandlers[header.flag]) {
    result = flagHandlers[header.flag](header);
  } else if (flagRe.test(header.flag)) {
    result = handleCommonFlags(header);
  }

  if (!result) return;

  result = {
    ...result,
    created: header.timestamp,
    int_id: header.intId,
    flag: header.flag,
  };

  return header.flag === '<='
    ? result
    : { ...result, str: [header.intId, header.flag, header.rest].join(' ') };
}

export default async function parseLogFile(content) {
  const parsed = { messages: [], logs: [] };
  for await (const line of content) {
    const info = parseLine(line.trim());
    if (!info) continue;

    if (info.flag === '<=') {
      parsed.messages.push(info);
    } else {
      parsed.logs.push(info);
    }
  }

  return parsed;
}
