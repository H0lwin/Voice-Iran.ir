from news.models import Post


def publish_post(post: Post) -> Post:
    post.status = Post.Status.PUBLISHED
    post.save(update_fields=["status", "updated_at"])
    return post
