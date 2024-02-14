import { useQuery } from "@tanstack/react-query";
import { fetchComments } from "./api";
import "./PostDetail.css";
import { Post } from "./Posts";

const PostDetail: React.FC<{ post: Post }> = ({ post }) => {
  // replace with useQuery
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments(post.id),
  });

  if (isLoading) return <h3>Loading...</h3>;
  if (isError)
    return (
      <h3>
        Oops, something went wrong.
        <p>{error.toString()}</p>
      </h3>
    );

  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <button>Delete</button> <button>Update title</button>
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
};

export default PostDetail;
