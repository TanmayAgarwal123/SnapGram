//import { GridPostList, Loader } from "@/components/shared";
//import { useGetCurrentUser } from "@/lib/react-query/queries";

import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/liked.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Liked Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {currentUser.liked.length === 0 ? (
            <p className="text-light-4">No liked posts</p>
          ) : (
              <GridPostList posts={currentUser.liked} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default LikedPosts;