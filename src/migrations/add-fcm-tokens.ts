import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFcmTokens1700000000000 implements MigrationInterface {
  name = 'AddFcmTokens1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add fcmToken column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'fcmToken',
        type: 'varchar',
        isNullable: true,
        comment: 'FCM token for push notifications',
      }),
    );

    // Add fcmToken column to companies table
    await queryRunner.addColumn(
      'companies',
      new TableColumn({
        name: 'fcmToken',
        type: 'varchar',
        isNullable: true,
        comment: 'FCM token for push notifications',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove fcmToken column from companies table
    await queryRunner.dropColumn('companies', 'fcmToken');

    // Remove fcmToken column from users table
    await queryRunner.dropColumn('users', 'fcmToken');
  }
}
