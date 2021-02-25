import { Button, Card, InputGroup, NonIdealState } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { SectionLayout } from "../layout/section-layout";
import { useSearchUsers } from "../octokit/search-user";

export const UserSearch = () => {
  const [q, setQuery] = useState("john");
  const [value, setValue] = useState("john");

  const { data, remove, refetch } = useSearchUsers({ q }, { enabled: !!q });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    console.log(q);
    q && refetch();
  }, [q, refetch]);

  const header = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(value);
      }}
    >
      <InputGroup
        placeholder="Search users"
        onChange={(e) => setValue(e.target.value)}
        inputRef={inputRef}
        value={value}
        rightElement={
          <Button
            onClick={() => {
              setQuery("");
              setValue("");
              remove();
              inputRef.current?.focus();
            }}
            disabled={!value}
            icon="cross"
            minimal
          />
        }
      />
    </form>
  );

  return (
    <SectionLayout header={header}>
      {!q && <SearchPrompt />}
      {data?.data.total_count === 0 && <NoResults />}
      {data?.data.total_count &&
        data.data.items.map(({ id, login, html_url, avatar_url }) => (
          <li key={id}>
            <a href={html_url} target="blank">
              {login}
            </a>
          </li>
        ))}
    </SectionLayout>
  );
};

const NoResults = () => (
  <NonIdealState
    icon="search"
    title="No search results"
    description={
      <>
        Your search didn't match any user.
        <br /> Try something different."
      </>
    }
  />
);

const SearchPrompt = () => (
  <NonIdealState
    icon="search"
    title="User search"
    description="Search users by username or name."
  />
);
