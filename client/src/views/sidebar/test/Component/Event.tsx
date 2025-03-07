import { FC, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import type { Idl } from "@coral-xyz/anchor";

import Foldable from "../../../../components/Foldable";
import { CodeResult } from "./CodeResult";
import { PgCommon, PgTest } from "../../../../utils/pg";
import { useConnection, useWallet } from "../../../../hooks";

interface EventProps {
  index: number;
  eventName: string;
  idl: Idl;
}

const Event: FC<EventProps> = ({ index, eventName, idl }) => {
  const [receivedEvents, setReceivedEvents] = useState<object[]>([]);

  const { connection } = useConnection();
  const { wallet } = useWallet();

  useEffect(() => {
    const program =
      idl && wallet ? PgTest.getProgram(idl, connection, wallet) : null;
    if (!program) return;

    const listener = program.addEventListener(eventName, (emittedEvent) => {
      setReceivedEvents((eventsSoFar) => [...eventsSoFar, emittedEvent]);
    });

    return () => {
      program.removeEventListener(listener);
    };
  }, [eventName, idl, connection, wallet]);

  return (
    <EventWrapper index={index}>
      <Foldable
        element={
          <EventName>{`${eventName} (${receivedEvents.length})`}</EventName>
        }
      >
        <CodeResult index={index}>
          {receivedEvents.map((ev) => PgCommon.prettyJSON(ev)).join("\n")}
        </CodeResult>
      </Foldable>
    </EventWrapper>
  );
};

interface EventWrapperProps {
  index: number;
}

const EventWrapper = styled.div<EventWrapperProps>`
  ${({ theme, index }) => css`
    padding: 1rem;
    border-top: 1px solid ${theme.colors.default.border};
    background: ${index % 2 === 0 &&
    theme.components.sidebar.right.default.otherBg};

    &:last-child {
      border-bottom: 1px solid ${theme.colors.default.border};
    }
  `}
`;

const EventName = styled.span`
  font-weight: bold;
`;

export default Event;
