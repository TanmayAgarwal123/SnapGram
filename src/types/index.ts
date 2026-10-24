  import { Models } from "appwrite";

  // ==========================================================================
  // Appwrite document models
  // These replace the untyped `Models.Document` (which used to carry an
  // implicit `any` index signature) with the concrete shapes our collections
  // store, so components get real autocomplete and type-safety.
  // ==========================================================================

  export type IUserDocument = Models.Document & {
    accountId: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    imageId?: string;
    bio?: string;
    posts?: IPostDocument[];
    liked?: IPostDocument[];
    save?: ISaveDocument[];
  };

  export type IPostDocument = Models.Document & {
    creator: IUserDocument;
    caption: string;
    tags: string[];
    imageUrl: string;
    imageId: string;
    location?: string;
    likes: IUserDocument[];
  };

  export type ISaveDocument = Models.Document & {
    user: IUserDocument;
    post: IPostDocument;
  };

  export type IContextType = {
    user: IUser;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    checkAuthUser: () => Promise<boolean>;
  };

  export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
  };
  
  export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
  };
  
  export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
  };
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
  };