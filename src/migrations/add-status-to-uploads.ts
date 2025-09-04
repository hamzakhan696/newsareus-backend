import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToUploads1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'uploads',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['pending', 'bid_received', 'accepted', 'rejected', 'completed'],
        default: "'pending'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('uploads', 'status');
  }
}
