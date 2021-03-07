import { RestEndpointMethodTypes } from "@octokit/rest";
import { Unpacked } from "../types/unpacked";

export type UserProfileDTO = Partial<
  Unpacked<RestEndpointMethodTypes["search"]["users"]["response"]["data"]["items"]>
>;

// type UserProfileDTO = {
//     login: string;
//     id: number;
//     node_id: string;
//     avatar_url: string;
//     gravatar_id: string;
//     url: string;
//     html_url: string;
//     followers_url: string;
//     subscriptions_url: string;
//     organizations_url: string;
//     repos_url: string;
//     received_events_url: string;
//     type: string;
//     score: number;
//     following_url: string;
//     gists_url: string;
//     starred_url: string;
//     events_url: string;
//     public_repos: number;
//     public_gists: number;
//     followers: number;
//     following: number;
//     created_at: string;
//     updated_at: string;
//     name: string;
//     bio: string;
//     email: string;
//     location: string;
//     site_admin: boolean;
//     hireable: boolean;
//     text_matches: {
//         object_url: string;
//         object_type: string;
//         property: string;
//         fragment: string;
//         matches: {
//             text: string;
//             indices: number[];
//         }[];
//     }[];
//     blog: string;
//     company: string;
//     suspended_at: string;
// }
