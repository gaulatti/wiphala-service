'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('playlists', 'context');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('playlists', 'context', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
};
