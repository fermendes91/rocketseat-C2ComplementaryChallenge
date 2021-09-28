import { useState, useEffect } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { FoodProps } from '../../types';

export default function Dashboard() {
  const [foods, setFoods] = useState<FoodProps[]>([]);
  const [editingFood, setEditingFood] = useState<FoodProps>({} as FoodProps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    const { data } = await api.get<FoodProps[]>('/foods');
    setFoods(data);
  }

  useEffect(() => {
    fetchProducts();
  }, [])

  const handleAddFood = async (food: {}) => {
    try {
      const { data: newFood } = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, newFood]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodProps) => {
    console.log({food})
    try {
      const { data: foodUpdated } = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map( (f: FoodProps) =>
        f.id !== foodUpdated.id ? f : foodUpdated,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);
    setFoods(foodsFiltered);
  }

  const toggleModal = () => setModalOpen(!modalOpen)
  const toggleEditModal = () => setEditModalOpen(!editModalOpen)

  const handleEditFood = (food: FoodProps) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}