import Slider from 'react-slick'
import { useUnit } from 'effector-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import ProductImagesItem from './ProductImagesItem'
import { $currentProduct } from '@/context/goods/state'
import { baseSliderSettings } from '@/constants/slider'
import styles from '@/styles/product/index.module.scss'

const ProductImages = () => {
  const product = useUnit($currentProduct)
  const isMedia1420 = useMediaQuery(1420)
  const isMedia1040 = useMediaQuery(1040)
  const isMedia520 = useMediaQuery(520)
  const isMedia420 = useMediaQuery(470)
  const imgSize = isMedia1040 ? 230 : isMedia1420 ? 280 : 480
  const slideImgSize = isMedia420 ? 280 : 432

  return (
    <>
      {!isMedia520 && (
        <ul className={`list-reset ${styles.product__top__images}`}>
          {product.images.map((img, i) => (
            <ProductImagesItem key={i + 1} image={img} imgSize={imgSize} />
          ))}
        </ul>
      )}
      {isMedia520 && (
        <Slider
          {...baseSliderSettings}
          className={styles.product__top__images__slider}
        >
          {product.images.map((img, i) => (
            <ProductImagesItem key={i + 1} image={img} imgSize={slideImgSize} />
          ))}
        </Slider>
      )}
    </>
  )
}

export default ProductImages
