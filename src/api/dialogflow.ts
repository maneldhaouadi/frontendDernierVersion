import { NextApiRequest, NextApiResponse } from 'next';
import axios from './axios';

type DialogflowResponse = {
  fulfillmentText: string;
  intent: string;
  parameters?: any;
  payload?: any;
};

const sendRequest = async (languageCode: string, queryText: string, sessionId: string): Promise<DialogflowResponse> => {
  try {
    const response = await axios.post('http://localhost:3001/dialogflow', {
      languageCode,
      queryText,
      sessionId,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': languageCode
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error calling backend:', error);
    return {
      fulfillmentText: languageCode === 'es' 
        ? 'Error al conectar con el servidor' 
        : 'Error connecting to server',
      intent: 'Error'
    };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { languageCode = 'es', queryText, sessionId } = req.body;

    console.log('Request received:', { languageCode, queryText, sessionId });

    try {
      const data = await sendRequest(languageCode, queryText, sessionId);
      res.status(200).json(data);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ 
        fulfillmentText: 'Internal Server Error',
        intent: 'Error'
      });
    }
  } else {
    res.status(405).json({ 
      fulfillmentText: 'Method Not Allowed',
      intent: 'Error'
    });
  }
};

export const dialogflow = {
  handler,
  sendRequest,
};

export default handler;