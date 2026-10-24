import { AppwriteException } from "appwrite";

/**
 * Turn any thrown value into a short, user-facing message.
 *
 * Appwrite already returns helpful messages, but a few common error `type`s
 * read better when mapped to friendlier copy. Anything unrecognised falls back
 * to the raw message, then to a generic line.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppwriteException) {
    switch (error.type) {
      case "user_invalid_credentials":
        return "Incorrect email or password.";
      case "user_already_exists":
      case "user_email_already_exists":
        return "An account with that email already exists.";
      case "user_name_already_exists":
      case "username_already_exists":
        return "That username is already taken.";
      case "user_session_already_exists":
        return "You're already signed in.";
      case "user_password_mismatch":
        return "The passwords don't match.";
      case "password_personal_data":
        return "Please choose a less common password.";
      case "general_rate_limit_exceeded":
        return "Too many attempts. Please wait a moment and try again.";
      case "general_unauthorized_scope":
        return "You need to be signed in to do that.";
      case "document_not_found":
        return "That item could not be found.";
      case "storage_file_type_unsupported":
        return "That file type isn't supported.";
      case "storage_invalid_file_size":
      case "storage_file_size_exceeded":
        return "That file is too large.";
      default:
        return error.message || "Something went wrong. Please try again.";
    }
  }

  if (error instanceof Error && error.message) return error.message;

  return "Something went wrong. Please try again.";
}

/** True when the error is Appwrite's "no active session / guest" response. */
export function isGuestError(error: unknown): boolean {
  return (
    error instanceof AppwriteException &&
    (error.code === 401 || error.type === "general_unauthorized_scope")
  );
}
