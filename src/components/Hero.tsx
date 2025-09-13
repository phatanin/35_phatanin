const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-6xl">
            แต่งเติมเรื่องราวในสไตล์คุณ
          </h2>
          <p className="mb-8 text-xl text-blue-100 md:text-2xl">
            ร้านค้าตัวอย่างของคุณ
            สำหรับเลือกชมเสื้อผ้าและเครื่องประดับหลากหลายสไตล์
          </p>
          <button className="cursor-pointer rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-colors duration-200 hover:bg-zinc-100">
            ช็อปเลย
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
