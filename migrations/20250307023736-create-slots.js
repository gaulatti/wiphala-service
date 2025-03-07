'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('slots', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      strategies_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'strategies', key: 'id' },
        onDelete: 'CASCADE',
      },
      plugins_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'plugins', key: 'id' },
        onDelete: 'CASCADE',
      },
      metadata: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
      conditions: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
      default_next_slot_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      min_outputs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
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
    await queryInterface.dropTable('slots');
  },
};
