import { PromotionsList } from './carousel-cards';

export const Carousel = ({ carouselData }) => {
  return (
    <section>
      <div className="mb-8 flex flex-col md:flex-row md:justify-between">
        <div>
          <h5 className="mb-4">Homepage carousels</h5>

          <p>
            Featured merchants products listed for increased visibility and
            engagements
          </p>
        </div>
      </div>
      <PromotionsList promotions={carouselData} />
    </section>
  );
};
