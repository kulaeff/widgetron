import { Link, Outlet } from "react-router-dom";
import styled from "styled-components";

const Root = styled.div`
  min-height: 100dvh;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.header`
  margin-bottom: 24px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 12px;
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export function App() {
  return (
    <Root>
      <Header>
        <h1>Widgetron</h1>
        <Nav>
          <NavLink to="/">Home</NavLink>
        </Nav>
      </Header>
      <main>
        <Outlet />
      </main>
    </Root>
  );
}
