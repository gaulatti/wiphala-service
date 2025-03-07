'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plugins', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      team_id: { type: Sequelize.INTEGER, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      grpc_host: { type: Sequelize.STRING(255), allowNull: false },
      grpc_port: { type: Sequelize.INTEGER, allowNull: false },
      plugin_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('plugins', ['team_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('plugins');
  },
};
