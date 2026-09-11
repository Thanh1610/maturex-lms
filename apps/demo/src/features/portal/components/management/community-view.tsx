import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Field,
  Icon,
  PageHead,
  useApp,
} from "@/components/ui";
import { categories, people } from "../../portal-data";

export function NewPost() {
  const { dispatch, close, notify } = useApp();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        dispatch({
          type: "post",
          value: {
            id: `post${Date.now()}`,
            person: "me",
            title: f.get("title"),
            body: f.get("body"),
            topic: f.get("topic"),
            likes: 0,
            liked: false,
            replies: [],
          },
        });
        notify("Đã đăng chia sẻ trong cộng đồng demo.");
        close();
      }}
    >
      <Field label="Tiêu đề">
        <input name="title" required minLength={5} />
      </Field>
      <Field label="Chủ đề">
        <select name="topic">
          {categories.slice(1).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Điều bạn muốn chia sẻ">
        <textarea name="body" required minLength={10} rows={6} />
      </Field>
      <div className="modal-actions flex justify-end items-center gap-2.5 mt-5 pt-4 border-t border-[#f0e8f7]">
        <Button type="submit" icon="Send">
          Đăng chia sẻ
        </Button>
      </div>
    </form>
  );
}

export function PostDetail({ id }: { id: string }) {
  const { state, dispatch } = useApp();
  const p = state.posts.find((p: any) => p.id === id);
  const [reply, setReply] = useState("");
  if (!p) return null;

  return (
    <div className="stack flex flex-col gap-4">
      <Badge>{p.topic}</Badge>
      <p className="text-[12px] leading-[2] text-[#817489] whitespace-pre-wrap">
        {p.body}
      </p>
      <h3 className="text-[14px] font-[550] text-[#9272a6] mt-2 mb-1">
        Trao đổi ({p.replies.length})
      </h3>
      {p.replies.map((r: any, i: number) => (
        <div
          className="reply p-[15px] bg-[#f8f2fd] rounded-lg text-[11px] text-[#887093]"
          key={i}
        >
          <strong className="block font-medium text-[#887093] mb-1">
            {r.name}
          </strong>
          <p className="m-0 text-[11px] leading-[1.8] text-[#817489]">
            {r.body}
          </p>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          dispatch({
            type: "reply",
            id,
            value: { name: "Minh Anh", body: reply.trim() },
          });
          setReply("");
        }}
        className="mt-2"
      >
        <Field label="Phản hồi của bạn">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            rows={3}
          />
        </Field>
        <div className="mt-3">
          <Button type="submit" icon="Send">
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </div>
  );
}

export function Community() {
  const { state, dispatch, open } = useApp();
  const [topic, setTopic] = useState("Tất cả");
  const posts = state.posts.filter(
    (p: any) => topic === "Tất cả" || p.topic === topic,
  );

  return (
    <>
      <PageHead
        eyebrow="TRI THỨC LỚN LÊN KHI ĐƯỢC CHIA SẺ"
        title="Cộng đồng học tập"
        description="Một góc nhìn mới, một bài học nhỏ, một cuộc trò chuyện có ý nghĩa."
      >
        <Button
          icon="Plus"
          onClick={() => open("Chia sẻ một điều đã học", <NewPost />)}
        >
          Viết chia sẻ
        </Button>
      </PageHead>
      <div className="community-layout grid grid-cols-[minmax(0,1fr)_270px] max-lg:grid-cols-[minmax(0,1fr)_240px] max-md:grid-cols-1 gap-[25px]">
        <div>
          <div className="chips flex flex-wrap gap-2 mb-5">
            {["Tất cả", "AI & Dữ liệu", "Văn hoá MatureX", "Chuyên môn"].map(
              (t) => (
                <button
                  className={`px-3 py-1.5 rounded-full text-[11px] border border-[#e6ddf0] cursor-pointer transition-colors ${
                    topic === t
                      ? "selected bg-[#9a76ae] text-white border-[#9a76ae]"
                      : "bg-white text-[#7d608d] hover:bg-[#faf6fd]"
                  }`}
                  key={t}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          {posts.map((post: any) => {
            const p = people.find((p) => p.id === post.person) || people[0];
            return (
              <article
                className="panel post-card bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-[25px] max-sm:p-5 mb-5"
                key={post.id}
              >
                <div className="between flex justify-between items-center">
                  <div className="person-line flex items-center gap-[11px]">
                    <Avatar person={p} />
                    <div>
                      <strong className="block text-[12px] text-[#8d6f9f] font-[550]">
                        {p.name}
                      </strong>
                      <small className="block text-[10px] text-[#817489] mt-1">
                        {p.job} · Chia sẻ trong demo
                      </small>
                    </div>
                  </div>
                  <Badge color={p.color}>{post.topic}</Badge>
                </div>
                <h2 className="text-[20px] max-sm:text-[18px] text-[#9272a6] my-6 mb-3.5 font-medium leading-[1.6]">
                  {post.title}
                </h2>
                <p className="text-[12px] max-sm:text-[11px] leading-[2] text-[#817489] whitespace-pre-wrap break-words">
                  {post.body}
                </p>
                <div className="post-actions border-t border-[#eee4f6] pt-[18px] mt-[22px] flex items-center gap-5">
                  <button
                    className={`text-[10px] flex items-center gap-1.5 p-0 cursor-pointer ${
                      post.liked
                        ? "liked text-[#a16fbf] font-medium"
                        : "text-[#b497c5] hover:text-[#9272a6]"
                    }`}
                    onClick={() => dispatch({ type: "like", id: post.id })}
                  >
                    <Icon name="ThumbsUp" size={17} />
                    {post.likes} hữu ích
                  </button>
                  <button
                    className="text-[10px] flex items-center gap-1.5 p-0 text-[#b497c5] hover:text-[#9272a6] cursor-pointer"
                    onClick={() =>
                      open(post.title, <PostDetail id={post.id} />)
                    }
                  >
                    <Icon name="MessageCircle" size={17} />
                    {post.replies.length} phản hồi
                  </button>
                  <button
                    className="text-btn text-[10px] text-[#9b87bc] hover:underline flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      open(post.title, <PostDetail id={post.id} />)
                    }
                  >
                    Tham gia trao đổi
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </article>
            );
          })}
          {!posts.length && (
            <Empty title="Chưa có chia sẻ trong chủ đề này">
              <Button
                onClick={() => open("Chia sẻ một điều đã học", <NewPost />)}
              >
                Bắt đầu cuộc trò chuyện
              </Button>
            </Empty>
          )}
        </div>
        <aside className="max-md:hidden">
          <div className="panel community-note bg-white border border-[var(--border,#e9eaf0)] rounded-[11px] p-5">
            <span className="icon-tile green w-10 h-10 rounded-lg flex items-center justify-center">
              <Icon name="Sprout" size={26} />
            </span>
            <h3 className="text-[14px] font-[550] mt-4 mb-2 text-[#665276]">
              Một không gian để cùng học
            </h3>
            <p className="text-[11px] text-[#817489] leading-[1.8] m-0 mb-4">
              Chia sẻ trải nghiệm cụ thể. Tôn trọng góc nhìn khác. Đặt câu hỏi
              để hiểu thêm.
            </p>
            <hr className="border-0 border-t border-[#f0e7f7] my-4" />
            <strong className="block text-[11px] text-[#a787b6] mb-1 font-medium">
              Gợi ý cho hôm nay
            </strong>
            <p className="text-[11px] text-[#817489] leading-[1.8] m-0">
              Điều gì bạn vừa áp dụng vào công việc? Kết quả thực tế đã dạy bạn
              điều gì?
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
