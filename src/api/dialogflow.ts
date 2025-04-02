import { NextApiRequest, NextApiResponse } from 'next';
import axios from './axios';

type DialogflowResponse = {
  fulfillmentText: string;
  outputContexts?: Array<{
    name: string;
    lifespanCount: number;
    parameters?: any;
  }>;
  intent?: string;
  parameters?: any;
  payload?: any;
};

type DialogflowRequestParams = {
  languageCode: string;
  queryText: string;
  sessionId: string;
  parameters?: any;
  outputContexts?: any[];
};

const sendRequest = async (
  params: DialogflowRequestParams
): Promise<DialogflowResponse> => {
  try {
    const response = await axios.post('http://localhost:3001/dialogflow', params, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': params.languageCode
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error calling backend:', error);
    return {
      fulfillmentText: params.languageCode === 'fr' 
        ? 'Erreur de connexion au serveur' 
        : 'Error connecting to server'
    };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const requestParams: DialogflowRequestParams = {
      languageCode: req.body.languageCode || 'fr',
      queryText: req.body.queryText,
      sessionId: req.body.sessionId,
      parameters: req.body.parameters,
      outputContexts: req.body.outputContexts
    };

    try {
      const data = await sendRequest(requestParams);
      res.status(200).json(data);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ 
        fulfillmentText: requestParams.languageCode === 'fr' 
          ? 'Erreur interne du serveur' 
          : 'Internal Server Error'
      });
    }
  } else {
    res.status(405).json({ 
      fulfillmentText: 'Method Not Allowed'
    });
  }
};

export const dialogflow = {
  handler,
  sendRequest,
};

export default handler;