import { ID, ImageGravity, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import {
  IUpdatePost,
  INewPost,
  INewUser,
  IUpdateUser,
  IPostDocument,
  IUserDocument,
} from "@/types";

// ============================================================
// AUTH
// ============================================================
//
// These functions let errors propagate (they throw) so React Query and the
// calling forms can surface a real message to the user. Functions that create
// side effects (uploaded files) clean those up before re-throwing. The one
// intentional exception is getCurrentUser(), which treats "no session" as a
// normal logged-out state and returns null rather than throwing.

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  const newAccount = await account.create({
    userId: ID.unique(),
    email: user.email,
    password: user.password,
    name: user.name,
  });

  const avatarUrl = avatars.getInitials({ name: user.name });

  const newUser = await saveUserToDB({
    accountId: newAccount.$id,
    name: newAccount.name,
    email: newAccount.email,
    username: user.username,
    imageUrl: avatarUrl,
  });

  return newUser;
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  // No generic here: on create, `data` is the write shape (not the populated
  // read model), so we let Appwrite accept the partial payload.
  return databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.userCollectionId,
    documentId: ID.unique(),
    data: user,
  });
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  return account.createEmailPasswordSession({
    email: user.email,
    password: user.password,
  });
}

// ============================== GET ACCOUNT
export async function getAccount() {
  return account.get();
}

// ============================== GET USER
export async function getCurrentUser(): Promise<IUserDocument | null> {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments<IUserDocument>({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    return currentUser.documents[0] ?? null;
  } catch {
    // No active session (guest) or the probe failed — treat as logged out.
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  return account.deleteSession({ sessionId: "current" });
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  // Upload file to appwrite storage
  const uploadedFile = await uploadFile(post.file[0]);

  try {
    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post (write shape: `creator` is the user id, not a user doc)
    return await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postCollectionId,
      documentId: ID.unique(),
      data: {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      },
    });
  } catch (error) {
    // Roll back the orphaned upload before surfacing the failure.
    await deleteFile(uploadedFile.$id);
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  return storage.createFile({
    bucketId: appwriteConfig.storageId,
    fileId: ID.unique(),
    file: file,
  });
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  return storage.getFilePreview({
    bucketId: appwriteConfig.storageId,
    fileId: fileId,
    width: 2000,
    height: 2000,
    gravity: ImageGravity.Top,
    quality: 100,
  });
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  await storage.deleteFile({
    bucketId: appwriteConfig.storageId,
    fileId: fileId,
  });
  return { status: "ok" };
}

// ============================== SEARCH POSTS
export async function searchPosts(searchTerm: string) {
  return databases.listDocuments<IPostDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    queries: [Query.search("caption", searchTerm)],
  });
}

export async function getInfinitePosts({ pageParam }: { pageParam: string }) {
  const queries: string[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  return databases.listDocuments<IPostDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    queries: queries,
  });
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw new Error("No post id provided");

  return databases.getDocument<IPostDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    documentId: postId,
  });
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  let image = {
    imageUrl: post.imageUrl.toString(),
    imageId: post.imageId,
  };

  let newlyUploadedFileId: string | null = null;

  try {
    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      newlyUploadedFileId = uploadedFile.$id;

      const fileUrl = getFilePreview(uploadedFile.$id);
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument<IPostDocument>({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postCollectionId,
      documentId: post.postId,
      data: {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      },
    });

    // Safely delete the old file after a successful update.
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    // Roll back a freshly uploaded file if the update failed.
    if (newlyUploadedFileId) {
      await deleteFile(newlyUploadedFileId);
    }
    throw error;
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) throw new Error("Missing post id or image id");

  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    documentId: postId,
  });

  await deleteFile(imageId);

  return { status: "Ok" };
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  // Write shape: `likes` is an array of user ids, not populated user docs.
  return databases.updateDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    documentId: postId,
    data: {
      likes: likesArray,
    },
  });
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  return databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.savesCollectionId,
    documentId: ID.unique(),
    data: {
      user: userId,
      post: postId,
    },
  });
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  await databases.deleteDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.savesCollectionId,
    documentId: savedRecordId,
  });
  return { status: "Ok" };
}

// ============================== GET USER'S POSTS
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  return databases.listDocuments<IPostDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    queries: [Query.equal("creator", userId), Query.orderDesc("$createdAt")],
  });
}

// ============================== GET RECENT POSTS
export async function getRecentPosts() {
  return databases.listDocuments<IPostDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.postCollectionId,
    queries: [Query.orderDesc("$createdAt"), Query.limit(20)],
  });
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: string[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  return databases.listDocuments<IUserDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.userCollectionId,
    queries: queries,
  });
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  return databases.getDocument<IUserDocument>({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.userCollectionId,
    documentId: userId,
  });
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;

  let image = {
    imageUrl: user.imageUrl.toString(),
    imageId: user.imageId,
  };

  let newlyUploadedFileId: string | null = null;

  try {
    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      newlyUploadedFileId = uploadedFile.$id;

      const fileUrl = getFilePreview(uploadedFile.$id);
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument<IUserDocument>({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: user.userId,
      data: {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      },
    });

    // Safely delete the old file after a successful update.
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    if (newlyUploadedFileId) {
      await deleteFile(newlyUploadedFileId);
    }
    throw error;
  }
}
