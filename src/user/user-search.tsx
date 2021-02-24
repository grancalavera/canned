import { Button, InputGroup, NonIdealState } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";
import { SectionLayout } from "../layout/section-layout";
import { useSearchUsers } from "../octokit/search-user";

export const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");

  const { data, remove, refetch } = useSearchUsers(
    { q: query, per_page: 2 },
    { enabled: !!query, staleTime: 0 }
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    query && refetch();
  }, [query, refetch]);

  const controls = (
    <>
      {input && (
        <Button
          icon="cross"
          onClick={() => {
            setQuery("");
            setInput("");
            remove();
            inputRef.current?.focus();
          }}
          minimal
        />
      )}
      <Button disabled={!input} intent="primary" type="submit" tabIndex={0}>
        Search
      </Button>
    </>
  );

  const header = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(input);
      }}
    >
      <InputGroup
        placeholder="Search users"
        onChange={(e) => setInput(e.target.value)}
        {...{ rightElement: controls, inputRef, value: input }}
      />
    </form>
  );

  return (
    <SectionLayout header={header}>
      {data && data?.data.total_count ? (
        <>
          <pre>Total Count: {data?.data.total_count}</pre>
          <pre>Incomplete Results: {data?.data.incomplete_results}</pre>
          <pre>{JSON.stringify(data?.data.items, null, 2)}</pre>
        </>
      ) : (
        <NonIdealState
          icon="search"
          title={query ? "No search results" : "User search"}
          description={
            query ? (
              <>
                Your search didn't match any user.
                <br /> Try something different."
              </>
            ) : (
              "Search users by username or name."
            )
          }
        />
      )}
    </SectionLayout>
  );
};
