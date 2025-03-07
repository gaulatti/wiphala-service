'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('playlists', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      strategies_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'strategies', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('CREATED', 'RUNNING', 'FAILED', 'COMPLETE'),
        defaultValue: 'CREATED',
        allowNull: false,
      },
      current_slot_id: {
        type: Sequelize.INTEGER,
        references: { model: 'slots', key: 'id' },
        onDelete: 'SET NULL',
      },
      context: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('playlists');
  },
};
