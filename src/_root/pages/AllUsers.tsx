import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
//import { Loader, UserCard } from "@/components/shared";

import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

const AllUsers = () => {
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  // The global React Query handler already toasts the error; just show a
  // recoverable message here (and never return undefined from a component).
  if (isErrorCreators) {
    return (
      <div className="common-container">
        <p className="body-medium text-light-3">
          Couldn't load people right now. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {isLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id} className="flex-1 min-w-[200px] w-full  ">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;