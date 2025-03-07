'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('strategies', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      team_id: { type: Sequelize.INTEGER, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      root_slot: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('strategies', ['team_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('strategies');
  },
};
