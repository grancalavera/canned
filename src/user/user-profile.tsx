import { Button, ButtonGroup, Card, Elevation, H5, InputGroup } from "@blueprintjs/core";
import { RestEndpointMethodTypes } from "@octokit/rest";
import React, { useEffect, useRef, useState } from "react";
import { useUsersGetByUsername } from "../octokit/get-user-by-username";

type User = RestEndpointMethodTypes["users"]["getByUsername"]["response"]["data"];

const UserLoader = () => {
  const [user, setUser] = useState<User>();
  const [username, setUsername] = useState("");
  const { data, remove, status, refetch } = useUsersGetByUsername(
    { username },
    {
      enabled: !!username,
    }
  );

  useEffect(() => {
    if (username) {
      refetch();
    } else {
      remove();
    }
  }, [refetch, remove, username]);

  useEffect(() => {
    status === "error" && remove();
  }, [status, remove]);

  useEffect(() => {
    status === "success" && data?.data && setUser(data.data);
  }, [data, status]);

  return (
    <>
      <LoadUserInput onLoadUser={(x) => setUsername(x)} />
      {user && (
        <Card elevation={Elevation.FOUR} style={{ marginTop: "1em" }}>
          <H5
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <a href={user.html_url} target="_blank" rel="noreferrer">
              {user.name ?? user.login}
            </a>
            <Button
              minimal
              icon="cross"
              onClick={() => {
                setUser(undefined);
              }}
            />
          </H5>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </Card>
      )}
    </>
  );
};

interface LoadUserInputProps {
  onLoadUser: (username: string) => void;
}

const LoadUserInput = ({ onLoadUser }: LoadUserInputProps) => {
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const Buttons = (
    <ButtonGroup>
      {username && <Button icon="cross" minimal onClick={() => setUsername("")} />}
      <Button disabled={!username} intent="primary" type="submit">
        Load
      </Button>
    </ButtonGroup>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        !!username && onLoadUser(username);
        inputRef.current?.select();
      }}
    >
      <InputGroup
        inputRef={inputRef}
        value={username}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        rightElement={Buttons}
      />
    </form>
  );
};
