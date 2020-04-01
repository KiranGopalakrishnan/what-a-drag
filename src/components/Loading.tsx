import * as React from 'react';
import styled from 'styled-components';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Container = styled.div`
    display: flex;
    background: #f2f2f2;
    color: #222;
    flex-direction: column;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
`;

const Loading: React.FC = () => <Container>Loading...</Container>;

export { Loading };
