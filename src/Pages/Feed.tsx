import { useEffect } from "react";
import axios from "axios";

export default function Feed() {
  function getPosts() {
    axios("https://route-posts.routemisr.com/posts/feed", {
      headers: {
        token: localStorage.getItem("token") || "",
      },
    })
      .then((data) => {
        console.log(data.data);
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  useEffect(() => {
    getPosts();
  }, []);

  return <div>Feed</div>;
}
