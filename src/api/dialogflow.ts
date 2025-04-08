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
  allRequiredParamsPresent?: boolean;
  quotationNumber?: string;
};

type DialogflowRequestParams = {
  languageCode: string;
  queryText: string;
  sessionId: string;
  parameters?: {
    fields?: {
      firmName?: { stringValue: string };
      InterlocutorName?: { stringValue: string };
      sequentialNumbr?: { stringValue: string };
      object?: { stringValue: string };
      date?: { stringValue: string };
      duedate?: { stringValue: string };
      status?: { stringValue: string };
      articleId?: { numberValue: number };
      quantity?: { numberValue: number };
      unitPrice?: { numberValue: number };
      discount?: { numberValue: number };
      discountType?: { stringValue: string };
      [key: string]: any;
    };
    [key: string]: any;
  };
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

// Helper function to create parameter fields
const createParameterFields = (params: {
  firmName?: string;
  InterlocutorName?: string;
  sequentialNumbr?: string;
  object?: string;
  date?: string;
  duedate?: string;
  status?: string;
  articleId?: number;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  discountType?: string;
}): any => {
  const fields: any = {};
  
  if (params.firmName) fields.firmName = { stringValue: params.firmName };
  if (params.InterlocutorName) fields.InterlocutorName = { stringValue: params.InterlocutorName };
  if (params.sequentialNumbr) fields.sequentialNumbr = { stringValue: params.sequentialNumbr };
  if (params.object) fields.object = { stringValue: params.object };
  if (params.date) fields.date = { stringValue: params.date };
  if (params.duedate) fields.duedate = { stringValue: params.duedate };
  if (params.status) fields.status = { stringValue: params.status };
  if (params.articleId) fields.articleId = { numberValue: params.articleId };
  if (params.quantity) fields.quantity = { numberValue: params.quantity };
  if (params.unitPrice) fields.unitPrice = { numberValue: params.unitPrice };
  if (params.discount) fields.discount = { numberValue: params.discount };
  if (params.discountType) fields.discountType = { stringValue: params.discountType };

  return { fields };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    let parameters = req.body.parameters;
    
    // Convert old firmId/interlocutorId to new firmName/InterlocutorName if needed
    if (req.body.parameters?.firmId && !req.body.parameters?.firmName) {
      parameters = {
        ...parameters,
        firmName: parameters.firmId,
        firmId: undefined
      };
    }
    
    if (req.body.parameters?.interlocutorId && !req.body.parameters?.InterlocutorName) {
      parameters = {
        ...parameters,
        InterlocutorName: parameters.interlocutorId,
        interlocutorId: undefined
      };
    }

    const requestParams: DialogflowRequestParams = {
      languageCode: req.body.languageCode || 'fr',
      queryText: req.body.queryText,
      sessionId: req.body.sessionId,
      parameters: parameters,
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
  createParameterFields // Export the helper function
};

export default handler;