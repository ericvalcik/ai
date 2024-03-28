'use server';

import {
  Message,
  OpenAIStream,
  experimental_StreamData,
  experimental_StreamingReactResponse,
} from 'ai';
import {experimental_buildOpenAIMessages} from 'ai/prompts';
import OpenAI from 'openai';
import {ChatCompletionCreateParams} from 'openai/resources/chat';

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: 'create_calendar_event',
    description: 'Create a Google calendar event. Ask user for length of the event and name of the event before calling this function.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the event.',
        },
        start_time: {
          type: 'string',
          description: 'The start datetime of the event as timestamp in the GMT time zone. The format is YYYYMMDDTHHMMSSZ',
        },
        end_time: {
          type: 'string',
          description: 'The end datetime of the event as timestamp in the GMT time zone. The format is YYYYMMDDTHHMMSSZ',
        },
      }
    }
  },
];

export async function handler({messages}: { messages: Message[] }) {
  const data = new experimental_StreamData();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: experimental_buildOpenAIMessages(messages),
    functions,
  });

  const stream = OpenAIStream(response, {
    onFinal() {
      data.close();
    },
    async experimental_onFunctionCall({name, arguments: args}) {
      switch (name) {
        case 'create_calendar_event': {
          data.append({
            type: 'calendar_event',
            title: args.title as string,
            start_time: args.start_time as string,
            end_time: args.end_time as string,
          });

          return;
        }
      }

      return undefined;
    },
    experimental_streamData: true,
  });

  return new experimental_StreamingReactResponse(stream, {
    data,
    ui({content, data}) {
      if (data?.[0] != null) {
        const value = data[0] as any;

        switch (value.type) {
          case 'calendar_event': {
            return (
              <div className="border border-black/75 hover:border-black rounded-2xl shadow-none hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col p-4 gap-4">
                <h1 className="tracking-tighter mr-20">Create <strong>{value.title}</strong> event that:</h1>
                <ul>
                  <li>starts at {value.start_time}</li>
                  <li>and ends at {value.end_time}</li>
                </ul>
                <div className="flex flex-row">
                  <button className="rounded-lg bg-blue-500 text-white px-1.5">Create Event</button>
                </div>
              </div>
            )
          }
        }
      }

      return <div>{content}</div>;
    },
  });
}
