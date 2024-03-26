// Note: If the action doesn't import any client components (Counter in our case),
// we don't need to pass it down to <Chat> over props — chat.ts can directly import
// that action.

import { handler } from './stream-react-response/action';
import { Chat } from './stream-react-response/chat';

export default function Page() {
  return <Chat handler={handler} />;
}

export const runtime = 'edge';
