import React from 'react';
import useConfig from '@/hooks/content/useConfig';
import useSocket from '@/hooks/useSocket';
import { toast } from 'sonner';
import { SocketRoom } from '@/types/enums/socket-room';
import { Sequential } from '@/types';

const useExpenseQuotationSocket = () => {
  const {
    configs: [sequence],
    isConfigPending: isQuotationSequencePending
  } = useConfig(['expensequotation_sequence']);

  const [currentSequence, setCurrentSequence] = React.useState<Sequential | null>(null);
  const hasJoinedRef = React.useRef(false);

  const socket = useSocket('/ws');

  React.useEffect(() => {
    if (sequence?.value) {
      setCurrentSequence(sequence.value);
    }
  }, [sequence]);

  React.useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (!hasJoinedRef.current) {
        socket.emit('joinRoom', SocketRoom.QUOTATION_SEQUENCE);
        console.log('Joined room: QUOTATION_SEQUENCE');
        hasJoinedRef.current = true;
      }
    };

    const handleQuotationSequenceUpdated = (data: { value: number }) => {
      setCurrentSequence((prevSequence) => 
        prevSequence ? { ...prevSequence, next: data.value } : { next: data.value }
      );
      toast.info('Le numéro séquentiel a été mis à jour');
    };

    const handleSocketError = (error: any) => {
      console.error('Socket connection error:', error);
      toast.error('Erreur de connexion au serveur');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from the WebSocket server');
      hasJoinedRef.current = false;
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('quotation-sequence-updated', handleQuotationSequenceUpdated);
    socket.on('connect_error', handleSocketError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      if (socket && hasJoinedRef.current) {
        socket.emit('leaveRoom', SocketRoom.QUOTATION_SEQUENCE);
        console.log('Left room: QUOTATION_SEQUENCE');
        hasJoinedRef.current = false;
      }

      socket.off('connect', handleConnect);
      socket.off('quotation-sequence-updated', handleQuotationSequenceUpdated);
      socket.off('connect_error', handleSocketError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return {
    currentSequence,
    isQuotationSequencePending
  };
};

export default useExpenseQuotationSocket;
