type SlugProps = {
  params: {
    slug: string;
  };
};

export default async function CoursePage({ params: { slug } }: SlugProps) {
  console.log(slug);
  return (
    <div>
      <span>Slug</span>
    </div>
  );
}
