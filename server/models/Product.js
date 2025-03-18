const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название продукта обязательно'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Цена продукта обязательна'],
    min: [0, 'Цена не может быть отрицательной']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Категория продукта обязательна']
  },
  image: {
    type: String,
    required: [true, 'Изображение продукта обязательно']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  infiniteStock: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    default: 0,
    min: [1, 'Минимальное количество товара - 1 штука'],
    validate: {
      validator: function(v) {
        // Если товар не в бесконечном количестве, проверяем минимальное значение
        if (!this.infiniteStock) {
          return v >= 1;
        }
        return true;
      },
      message: 'Минимальное количество товара - 1 штука'
    }
  },
  discount: {
    type: Number,
    min: [0, 'Скидка не может быть отрицательной'],
    max: [100, 'Скидка не может быть больше 100%'],
    default: 0
  },
  specifications: [{
    name: String,
    value: String
  }]
}, {
  timestamps: true
});

// Middleware для обновления updatedAt и статуса наличия перед сохранением
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Если товар не в бесконечном количестве, проверяем его наличие
  if (!this.infiniteStock) {
    this.inStock = this.quantity > 0;
  }
  
  next();
});

// Middleware для обновления статуса наличия при обновлении количества
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && typeof update.quantity !== 'undefined' && !update.infiniteStock) {
    update.inStock = update.quantity > 0;
  }
  next();
});

// Виртуальное поле для форматированной цены
productSchema.virtual('formattedPrice').get(function() {
  return `${this.price.toLocaleString('ru-RU')} ₽`;
});

// Индексы для оптимизации поиска
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isAvailable: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 