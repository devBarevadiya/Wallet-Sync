import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const CustomHelmet = ({
  title = "",
  description = "Wallet sync offers a secure and user-friendly wallet web app to manage your digital assets effortlessly. Enjoy seamless transactions, advanced security features, and an intuitive interface for an enhanced financial experience.",
  image = import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL,
  canonical = String(window.location.href),
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="author" content={title} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={canonical} />
    </Helmet>
  );
};

CustomHelmet.propTypes = {
  title: PropTypes.any,
  description: PropTypes.any,
  image: PropTypes.any,
  canonical: PropTypes.any,
};

export default CustomHelmet;
