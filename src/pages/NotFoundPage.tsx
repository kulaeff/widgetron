import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.section`
  display: grid;
  gap: 8px;
`;

const BackLink = styled(Link)`
  width: fit-content;
  color: ${({ theme }) => theme.colors.accent};
`;

export function NotFoundPage() {
  return (
    <Wrapper>
      <h2>404</h2>
      <p>Page not found</p>
      <BackLink to="/">Back to home</BackLink>
    </Wrapper>
  );
}
