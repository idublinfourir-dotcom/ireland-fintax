"use client";

import { startTransition, type FormEvent } from "react";

/**
 * An onSubmit handler that runs a useActionState action WITHOUT React 19's
 * automatic form reset.
 *
 * Passed as `<form action>`, React resets every uncontrolled field once the
 * action finishes, even when the server refused the save, so one value caught
 * by a guardrail threw away everything else the admin had typed. Calling the
 * action from onSubmit keeps the fields as they are. The clicked button rides
 * along as the FormData submitter, so name/value buttons (Cancel) still work.
 */
export function submitKeepingValues(action: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => action(data));
  };
}
